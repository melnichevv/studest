import graphene
from graphene import String, Int, Boolean
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
        filter_fields = {'name': ['icontains']}
        interfaces = (graphene.Node,)


class QuestionType(DjangoObjectType):
    type = String()
    question = String()
    video_url = String()
    img_url = String()
    audio_url = String()
    other_url = String()
    # labels = ''

    class Meta:
        model = Question
        filter_fields = {'type': ['exact']}
        interfaces = (graphene.Node,)


class AnswerType(DjangoObjectType):
    text = String()
    correct = Boolean()

    class Meta:
        model = Answer
        interfaces = (graphene.Node,)


class TestResultType(DjangoObjectType):

    class Meta:
        model = TestResult
        interfaces = (graphene.Node,)


class QuestionAnswerType(DjangoObjectType):

    class Meta:
        model = QuestionAnswer
        interfaces = (graphene.Node,)


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

    status = graphene.Int()
    formErrors = graphene.String()
    question = graphene.Field(QuestionType)
    # answer = graphene.String()
    # message = graphene.Field(TestType)

    def mutate(self, info, answers, question):
        answers = [from_global_id(x)[1] for x in answers]
        question = Question.objects.get(uuid=question)
        answers = Answer.objects.filter(question=question, id__in=answers)
        current_user = info.context.user


class Mutation(object):
    create_test = CreateTestMutation.Field()
    create_question_answer = CreateQuestionAnswerMutation.Field()


class Query(object):
    all_tests = DjangoFilterConnectionField(TestType)
    # all_tests = graphene.List(TestType)
    test = graphene.Field(
        TestType,
        id=graphene.ID(),
        uuid=graphene.String(),
        name=graphene.String()
    )
    test_questions = DjangoFilterConnectionField(QuestionType)
    current_user = graphene.Field(UserType)

    def resolve_all_tests(self, info, **kwargs):
        return Test.objects.all()

    def resolve_test_questions(self, info, **kwargs):
        return Question.objects.all()

    def resolve_test(self, info, uuid):
        return Test.objects.get(uuid=uuid)

    def resolve_current_user(self, info, **kwargs):
        context = info.context
        if not context.user.is_authenticated:
            return None
        return context.user
