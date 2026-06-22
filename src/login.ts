import axios from "axios";

export async function getLoginToken(usernameArgument: string, passwordArgument: string, world: number): Promise<string> {
  console.log(`Login ${usernameArgument} with ${passwordArgument} on world ${world}`);

  try {

    const response = await axios.post(
      "https://highspell.com:3002/getLoginToken",
      {
        username: usernameArgument,
        password: passwordArgument,
        serverId: world,
        currentClientVersion: 61
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    return response.data.data.token;
  } catch (error: any) {
    console.error("Login token request failed:", error.response?.data || error.message);
    throw error;
  }
}