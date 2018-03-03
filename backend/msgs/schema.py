from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
import json

import graphene
from graphene_django.types import DjangoObjectType
from graphene_django.filter.fields import DjangoFilterConnectionField
from graphql_relay.node.node import from_global_id

from . import models


class UserType(DjangoObjectType):
    class Meta:
        model = User


class MessageType(DjangoObjectType):
    class Meta:
        model = models.Message
        filter_fields = {'message': ['icontains']}
        interfaces = (graphene.Node, )


class CreateMessageMutation(graphene.Mutation):
    class Arguments:
        message = graphene.String()

    status = graphene.Int()
    formErrors = graphene.String()
    message = graphene.Field(MessageType)

    @staticmethod
    def mutate(self, info, message):
        context = info.context
        message = models.Message(user=context.user, message=message)
        if not context.user.is_authenticated:
            return CreateMessageMutation(status=403)

        try:
            message.full_clean()

        except ValidationError as e:
            return CreateMessageMutation(status=400, formErrors=json.dumps(e))
        else:
            message.save()
            return CreateMessageMutation(status=200, message=message)


class Mutation(object):
    create_message = CreateMessageMutation.Field()


class Query(object):
    all_messages = DjangoFilterConnectionField(MessageType)
    current_user = graphene.Field(UserType,
                                  id=graphene.Int(),
                                  name=graphene.String())
    message = graphene.Field(MessageType,
                             id=graphene.ID(),
                             message=graphene.String())


    def resolve_all_messages(self, info, **kwargs):
        return models.Message.objects.all()

    def resolve_message(self, info, id):
        rid = from_global_id(id)
        return models.Message.objects.get(pk=rid[1])

    def resolve_current_user(self, info, **kwargs):
        context = info.context
        if not context.user.is_authenticated:
            return None
        return context.user