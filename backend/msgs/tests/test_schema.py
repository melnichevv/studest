from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory

import pytest
from graphene.test import Client

from mixer.backend.django import mixer
from graphql_relay.node.node import to_global_id

from .. import schema
from backend.schema import schema as my_schema

pytestmark = pytest.mark.django_db


def test_user_type():
    instance = schema.UserType()
    assert instance


def test_message_type():
    instance = schema.MessageType()
    assert instance


def test_resolve_current_user():
    req = RequestFactory().get('/')
    req.user = AnonymousUser()
    client = Client(my_schema)
    client.user = AnonymousUser()
    executed = client.execute(''' { currentUser { id } }''', context_value=req)

    assert executed['data']['currentUser'] is None, 'Should return None if user is not authenticated'

    req.user = mixer.blend('auth.User')
    executed = client.execute('''{ currentUser { id } }''', context_value=req)
    assert executed['data']['currentUser']['id'] == str(req.user.id), 'Should return the current user if is authenticated'


def test_resolve_message():
    msg = mixer.blend('simple_app.Message')
    q = schema.Query()
    message_id = to_global_id('MessageType', msg.pk)
    res = q.resolve_message(None, message_id)
    assert res == msg, 'Should return requested message'


def test_resolve_all_messages():
    mixer.blend('simple_app.Message')
    mixer.blend('simple_app.Message')
    q = schema.Query()
    res = q.resolve_all_messages(None)
    assert res.count() == 2, 'Should return all messages'


def test_create_message_mutation():
    req = RequestFactory().get('/')
    req.user = AnonymousUser()
    client = Client(my_schema)
    executed = client.execute('''
        mutation {
          createMessage(message: "Murat") {
            status
            formErrors
          }
        }
        ''', context_value=req)

    assert 'errors' in executed, 'Should contain error message'

    req.user = mixer.blend('auth.User')
    executed = client.execute('''
            mutation {
              createMessage(message: "Murat") {
                status
                formErrors
              }
            }
        ''', context_value=req)

    assert executed['data']['createMessage']['status'] == 200
    assert executed['data']['createMessage']['formErrors'] is None