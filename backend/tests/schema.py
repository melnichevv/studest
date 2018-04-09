from django.core.exceptions import ValidationError
import json

import graphene
from graphene import String, Int
from graphene_django.types import DjangoObjectType
from graphene_django.filter.fields import DjangoFilterConnectionField
from graphql_relay.node.node import from_global_id

from tests.models import Test


class TestType(DjangoObjectType):
    name = String()
    minutes = Int()
    description = String()

    class Meta:
        model = Test
        filter_fields = {'name': ['icontains']}
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


class Mutation(object):
    create_test = CreateTestMutation.Field()


class Query(object):
    all_tests = DjangoFilterConnectionField(TestType)
    # all_tests = graphene.List(TestType)
    test = graphene.Field(
        TestType,
        id=graphene.ID(),
        uuid=graphene.String(),
        name=graphene.String()
    )

    def resolve_all_tests(self, info, **kwargs):
        return Test.objects.all()

    def resolve_test(self, info, uuid):
        return Test.objects.get(uuid=uuid)

    def resolve_current_user(self, info, **kwargs):
        context = info.context
        if not context.user.is_authenticated:
            return None
        return context.user
