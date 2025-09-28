import { ObjectType, Field } from '@nestjs/graphql'

import { User as UserGQL } from 'src/user/entity/user.entity'

@ObjectType()
export class AuthResponse {
    @Field()
    access_token: string

    @Field(() => UserGQL)
    user: UserGQL
}
