import graphene

from graphene_django.types import DjangoObjectType
from django.utils.translation import gettext as _

from users.models import User


class UserType(DjangoObjectType):
    class Meta:
        model = User


class RegisterMutation(graphene.Mutation):
    class Arguments:
        email = graphene.String()
        first_name = graphene.String()
        last_name = graphene.String()
        password = graphene.String()

    status = graphene.Int()
    formErrors = graphene.JSONString()
    user = graphene.Field(UserType)

    def mutate(self, info, email, first_name, last_name, password):
        if User.objects.filter(email=email).exists():
            return RegisterMutation(status=400,
                                    formErrors={'email': _('This email is already in use')})

        if all((email, first_name, last_name, password)):
            user = User()
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.set_password(password)
            user.is_active = True
            user.save()
            return RegisterMutation(status=200, user=user)

        return RegisterMutation(
            status=500,
            formErrors={'nonForm': _('Something went wrong. Try again please.')}
        )


class Mutation(object):
    register = RegisterMutation.Field()


class Query(object):
    pass
