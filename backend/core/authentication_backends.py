import logging

from django.contrib.auth.backends import AllowAllUsersModelBackend
from django.forms import ValidationError
from django.utils.safestring import mark_safe
from django.utils.timezone import now as tz_now

from users.models import User

logger = logging.getLogger(__name__)


class WrongCredentials(ValidationError):
    pass


def get_user_by_email(email):
    try:
        return User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return None
    except User.MultipleObjectsReturned:
        logger.warning("Found multiple users with the same email: %s", email)
        return None


def get_user_by_username(username):
    try:
        return User.objects.get(username=username)
    except User.DoesNotExist:
        return None


class EmailAuthBackend(AllowAllUsersModelBackend):

    """
    Enables users to log in with their email address,
    rather than usernames. Original source:
    http://www.djangosnippets.org/snippets/74/#c195
    """

    def authenticate(self, request, username=None, password=None, **kwargs):

        if not isinstance(username, str):
            return None

        # assume we are using email address, fall back to username
        user = get_user_by_email(username) or get_user_by_username(username)
        if user and user.check_password(password):
            User.objects.filter(pk=user.pk).update(last_visited_at=tz_now())
            return user
        else:
            raise WrongCredentials(
                mark_safe(
                    "Hmm, we can't find that combination of email address and password. "
                    "Have you definitely registered with YJ?"
                )
            )


class ForcedAuthBackend(AllowAllUsersModelBackend):
    """
    Allows us to programatically log users in.

    This is a no-op Django Authentication backend which only exists
    so that we can login a user programatically when we either don't
    need to authenticate them, or have already authed them via other
    means.

    When using the django.contrib.auth.login function, it requires a
    module path string which it attaches to the User session. This is
    meant to be the module path of the authentication backend used to
    authenticate the user.

    To get this, the login function either relies on the User instance's
    `backend` attribute to already be set, or you can pass in the
    `backend` kwarg which will then use that instead.

    The key point is that without a backend module string, the login()
    function will not work, so we fake it by providing a module path to
    this class, this ensuring we can log in a user programmatically.

    When you know you can log a user in, simply do this:

        from django.contrib.auth import login
        login(request, user, backend=settings.FORCED_AUTH_BACKEND)
    """

    def authenticate(self, *args, **kwargs):
        # Deliberately return None (meaning not authed) so that this fake
        # auth backend can never be accidentally used as a real auth backend.
        return None
