# Generated by Django 2.0.2 on 2018-04-14 15:23

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('tests', '0004_auto_20180402_1828'),
    ]

    operations = [
        migrations.AddField(
            model_name='test',
            name='start_at',
            field=models.DateTimeField(default=datetime.datetime(2018, 4, 14, 15, 23, 15, 318115, tzinfo=utc), verbose_name='start at'),
            preserve_default=False,
        ),
    ]