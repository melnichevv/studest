import graphene
from graphene import String, Int, Boolean, Field
from graphene_django.types import DjangoObjectType
from graphene_django.filter.fields import DjangoFilterConnectionField
from graphql_relay.node.node import from_global_id
from tests.models import Test, Question, Answer, TestResult, QuestionAnswer
from users.schema import UserType


class TestType(DjangoObjectType):
    name = String()
    minutes = Int()
    start_at = String()
    description = String()

    class Meta:
        model = Test
        filter_fields = {'name': ['icontains'], 'solved_tests__status': ['exact']}
        interfaces = (graphene.Node,)


class TestResultType(DjangoObjectType):
    name = String()
    minutes = Int()
    start_at = String()
    description = String()

    class Meta:
        model = TestResult
        filter_fields = {'test__name': ['icontains'], 'status': ['exact']}
        interfaces = (graphene.Node,)


class AnswerType(DjangoObjectType):
    text = String()
    correct = Boolean()

    class Meta:
        model = Answer
        interfaces = (graphene.Node,)


class QuestionType(DjangoObjectType):
    type = String()
    question = String()
    video_url = String()
    img_url = String()
    audio_url = String()
    other_url = String()
    current_answer = String()
    # labels = ''

    class Meta:
        model = Question
        filter_fields = {'type': ['exact']}
        interfaces = (graphene.Node,)

    @staticmethod
    def resolve_current_answer(instance: Question, info):
        user_answers = instance.user_answers.filter(student=info.context.user).first()
        if not user_answers:
            return

        if instance.type == Question.RADIO:
            return user_answers.answer[0]
        return user_answers.answer

#
# class TestResultType(DjangoObjectType):
#
#     class Meta:
#         model = TestResult
#         interfaces = (graphene.Node,)


class QuestionAnswerType(DjangoObjectType):

    class Meta:
        model = QuestionAnswer
        interfaces = (graphene.Node,)

    @staticmethod
    def resolve_answer(instance: QuestionAnswer, info):
        if instance.question.type == Question.RADIO:
            return instance.answer[0]
        return instance.answer


class CreateTestMutation(graphene.Mutation):
    class Arguments:
        message = graphene.String()

    status = graphene.Int()
    formErrors = graphene.String()
    message = graphene.Field(TestType)

    @staticmethod
    def mutate(self, info, name):
        pass
        # context = info.context
        # message = Message(user=context.user, message=message)
        # if not context.user.is_authenticated:
        #     return CreateTestMutation(status=403)
        #
        # try:
        #     message.full_clean()
        #
        # except ValidationError as e:
        #     return CreateTestMutation(status=400, formErrors=json.dumps(e))
        # else:
        #     message.save()
        #     return CreateTestMutation(status=200, message=message)


class CreateQuestionAnswerMutation(graphene.Mutation):
    class Arguments:
        answers = graphene.List(graphene.String)
        question = graphene.String()
        test_result = graphene.String()

    status = graphene.Int()
    formErrors = graphene.String()
    answer = graphene.Field(QuestionAnswerType)

    def mutate(self, info, test_result, answers, question):
        current_user = info.context.user
        test_result = TestResult.objects.filter(uuid=test_result, user=current_user).first()
        question = Question.objects.get(uuid=question)
        answer = None
        if question.type == Question.CHECKBOX:
            # answer = [from_global_id(x)[1] for x in answers]
            answer = answers
        elif question.type == Question.RADIO:
            answer = answers[0]
        elif question.type == Question.TEXT:
            answer = answers[0]

        qa = QuestionAnswer.get_or_create(
            question=question,
            student=current_user,
            result=test_result,
            answer=answer
        )
        return CreateQuestionAnswerMutation(status=200, answer=qa)


class Mutation(object):
    create_test = CreateTestMutation.Field()
    create_question_answer = CreateQuestionAnswerMutation.Field()


class Query(object):
    all_tests = DjangoFilterConnectionField(TestType)

    def resolve_all_tests(self, info, **kwargs):
        return Test.objects.all()

    user_tests = DjangoFilterConnectionField(TestResultType)

    def resolve_user_tests(self, info, **kwargs):
        user = info.context.user
        if not user.is_authenticated:
            return Test.objects.none()
        results = TestResult.objects.filter(user=user)
        # TODO filter results here
        return results

    test = graphene.Field(
        TestType,
        id=graphene.ID(),
        uuid=graphene.String(),
        name=graphene.String()
    )

    def resolve_test(self, info, uuid):
        return Test.objects.get(uuid=uuid)

    test_result = graphene.Field(
        TestResultType,
        id=graphene.ID(),
        uuid=graphene.String()
    )

    def resolve_test_result(self, info, uuid):
        user = info.context.user
        if not user.is_authenticated:
            return None
        result = TestResult.objects.filter(user=user, uuid=uuid).first()
        return result

    test_questions = DjangoFilterConnectionField(QuestionType)

    def resolve_test_questions(self, info, **kwargs):
        return Question.objects.all()

    current_user = graphene.Field(UserType)

    def resolve_current_user(self, info, **kwargs):
        context = info.context
        if not context.user.is_authenticated:
            return None
        return context.user
