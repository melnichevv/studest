import graphene
import msgs.schema


class Mutations(
    msgs.schema.Mutation,
    graphene.ObjectType
):
    pass


class Queries(
    msgs.schema.Query,
    graphene.ObjectType
):
    pass


schema = graphene.Schema(query=Queries, mutation=Mutations)
