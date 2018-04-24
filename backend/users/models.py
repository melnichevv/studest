from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    username = None
    email = models.EmailField(
        _('email address'),
        unique=True,
        error_messages={
            'unique': _("A user with that username already exists."),
        },
    )
    last_visited_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        if not self.get_full_name():
            return self.username
        return self.get_full_name()
