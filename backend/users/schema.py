from graphene_django.types import DjangoObjectType
from users.models import User


class UserType(DjangoObjectType):
    class Meta:
        model = User
