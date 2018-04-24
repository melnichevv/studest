import graphene
import msgs.schema as msgs_schema
import tests.schema as test_schema
import users.schema as user_schema


class Mutations(
    msgs_schema.Mutation,
    test_schema.Mutation,
    user_schema.Mutation,
    graphene.ObjectType
):
    pass


class Queries(
    msgs_schema.Query,
    test_schema.Query,
    user_schema.Query,
    graphene.ObjectType
):
    pass


schema = graphene.Schema(query=Queries, mutation=Mutations)
