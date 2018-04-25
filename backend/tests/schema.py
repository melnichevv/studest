import graphene
from django.utils import timezone
from graphene import String, Int, Boolean
from graphene_django.types import DjangoObjectType
from graphene_django.filter.fields import DjangoFilterConnectionField
from tests.models import Test, Question, Answer, TestResult, QuestionAnswer
from users.schema import UserType


class TestType(DjangoObjectType):
    name = String()
    minutes = Int()
    start_at = String()
    description = String()
    result = graphene.Field('tests.schema.TestResultType')

    class Meta:
        model = Test
        filter_fields = {'name': ['icontains'], 'solved_tests__status': ['exact'], 'status': ['exact']}
        interfaces = (graphene.Node,)

    @staticmethod
    def resolve_result(instance: Test, info):
        return TestResult.objects.filter(test=instance, user=info.context.user).first()


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
        user_answers = instance.user_answers.filter(
            student=info.context.user,
            result__uuid=info.variable_values['uuid']
        ).first()
        if not user_answers:
            return

        answer = user_answers.answer[0]

        if instance.type == Question.RADIO:
            return answer[0]  # FIXME THIS IS FUCKING RIDICULOUS
        return answer

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


class StartTestMutation(graphene.Mutation):
    class Arguments:
        test = graphene.String()

    status = graphene.Int()

    def mutate(self, info, test):
        test = Test.objects.get(uuid=test)
        if not info.context.user.is_authenticated:
            return StartTestMutation(status=404)
        test_result, _ = TestResult.objects.get_or_create(
            user=info.context.user,
            test=test,
            status=TestResult.NEW
        )
        test_result.start()
        return StartTestMutation(status=200)


class FinishTestMutation(graphene.Mutation):
    class Arguments:
        test = graphene.String()

    status = graphene.Int()
    test_result = graphene.Field(TestResultType)

    def mutate(self, info, test):
        test = Test.objects.get(uuid=test)
        if not info.context.user.is_authenticated:
            return FinishTestMutation(status=404)
        try:
            test_result = TestResult.objects.get(
                user=info.context.user,
                test=test,
                status=TestResult.IN_PROGRESS
            )
        except TestResult.DoesNotExist:
            return FinishTestMutation(status=404)
        test_result = test_result.finish()
        return FinishTestMutation(status=200, test_result=test_result)


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
            answer = answers
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
    start_test = StartTestMutation.Field()
    finish_test = FinishTestMutation.Field()


class Query(object):
    all_tests = DjangoFilterConnectionField(TestType)

    def resolve_all_tests(self, info, **kwargs):
        return Test.objects.all()

    user_tests = DjangoFilterConnectionField(TestType)

    def resolve_user_tests(self, info, **kwargs):
        user = info.context.user
        if not user.is_authenticated:
            return Test.objects.none()
        user_tests_ids = list(TestResult.objects.filter(user=user).values_list('test', flat=True))
        accessible_tests_ids = list(
            Test.objects.filter(
                status=Test.STATUS_OPEN,
                start_at__lte=timezone.now(),
                end_at__gte=timezone.now(),
                accessible_by=Test.ACCESSIBLE_BY_ANYONE
            ).values_list('id', flat=True)
        )
        test_ids = set(user_tests_ids + accessible_tests_ids)
        results = Test.objects.filter(pk__in=test_ids).all()
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
