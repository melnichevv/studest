# Generated by Django 2.0.2 on 2018-04-22 20:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tests', '0009_auto_20180422_1435'),
    ]

    operations = [
        migrations.AlterField(
            model_name='testresult',
            name='start_time',
            field=models.DateTimeField(auto_now=True, null=True, verbose_name='start time'),
        ),
    ]
