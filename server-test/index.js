import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import { config } from "dotenv";

config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 4000;
const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

async function executeGraphQL(query, variables) {
  const response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `GraphQL request failed with status ${response.status}: ${errorBody}`,
    );
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.errors) {
    console.error("GraphQL Errors:", JSON.stringify(result.errors, null, 2));

    const errorMessage = result.errors.map((e) => e.message).join("; ");
    throw new Error(`GraphQL execution failed: ${errorMessage}`);
  }
  return result.data;
}

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body.input.userData;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const INSERT_USER_MUTATION = `
      mutation InsertUser($username: String!, $email: String!, $password_hash: String!) {
        insert_users_one(object: {username: $username, email: $email, password_hash: $password_hash}) {
          id
          username
          email
          created_at
        }
      }
    `;

    const data = await executeGraphQL(INSERT_USER_MUTATION, {
      username,
      email,
      password_hash: hashedPassword,
    });

    return res.json(data.insert_users_one);
  } catch (error) {
    console.error("Signup Error:", error.message);

    if (
      (error.message && error.message.includes("Uniqueness violation")) ||
      (error.message && error.message.includes("unique constraint"))
    ) {
      return res
        .status(400)
        .json({ message: "Username or email already exists." });
    }
    return res.status(500).json({
      message: error.message || "Internal server error during signup",
    });
  }
});

app.post("/login", async (req, res) => {
  const { emailOrUsername, password } = req.body.input.credentials;

  if (!emailOrUsername || !password) {
    return res
      .status(400)
      .json({ message: "Email/Username and password are required" });
  }

  try {
    const GET_USER_QUERY = `
      query GetUser($emailOrUsername: String!) {
        users(where: {_or: [{email: {_eq: $emailOrUsername}}, {username: {_eq: $emailOrUsername}}]}) {
          id
          username
          email
          password_hash
        }
      }
    `;

    const userData = await executeGraphQL(GET_USER_QUERY, {
      emailOrUsername: emailOrUsername,
    });

    if (!userData.users || userData.users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = userData.users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        "https://hasura.io/jwt/claims": {
          "x-hasura-allowed-roles": ["user"],
          "x-hasura-default-role": "user",
          "x-hasura-user-id": user.id,
        },
      },
      JWT_SECRET,
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error during login" });
  }
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
  if (!HASURA_GRAPHQL_ENDPOINT || !HASURA_ADMIN_SECRET) {
    console.warn(
      "Warning: HASURA_GRAPHQL_ENDPOINT or HASURA_ADMIN_SECRET is not set in .env. Auth server might not connect to Hasura.",
    );
  }
});
