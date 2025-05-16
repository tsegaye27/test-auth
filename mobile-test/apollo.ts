import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HASURA_GRAPHQL_URL = "https://healthy-eagle-18.hasura.app/v1/graphql";

const httpLink = createHttpLink({
  uri: HASURA_GRAPHQL_URL,
});

const authLink = setContext(async (_, { headers }) => {
  console.log("[AuthLink] Executing for a request...");
  const token = await AsyncStorage.getItem("userToken");
  console.log("[AuthLink] Token from AsyncStorage:", token);

  if (token) {
    const newHeaders = {
      ...headers,
      authorization: `Bearer ${token}`,
    };
    console.log(
      "[AuthLink] Token found. Sending headers:",
      JSON.stringify(newHeaders),
    );
    return { headers: newHeaders };
  }
  console.log(
    "[AuthLink] No token found. Sending original headers:",
    JSON.stringify(headers),
  );
  return { headers };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
