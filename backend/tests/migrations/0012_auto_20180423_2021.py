# Generated by Django 2.0.2 on 2018-04-23 20:21

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tests', '0011_auto_20180423_1904'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='testresult',
            unique_together={('test', 'user')},
        ),
    ]
