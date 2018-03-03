from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    last_visited_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        if not self.get_full_name():
            return self.username
        return self.get_full_name()
