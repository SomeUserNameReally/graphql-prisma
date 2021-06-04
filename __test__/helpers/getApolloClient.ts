import ApolloBoost, { gql } from "apollo-boost";
import { Maybe } from "graphql/jsutils/Maybe";
import fetch from "node-fetch";

export const getApolloClient = (token?: Maybe<string>) =>
    new ApolloBoost({
        uri: "http://localhost:4000",
        fetch,
        request(op) {
            if (token) {
                op.setContext({
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
        }
    });
