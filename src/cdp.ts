import http from "node:http";
import WebSocket from "ws";

export interface DiscordTarget {
  id: string;
  title: string;
  type: string;
  url: string;
  webSocketDebuggerUrl: string;
}

export async function getDiscordDebugTarget(port = 9222): Promise<DiscordTarget> {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/json`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const targets = JSON.parse(data) as DiscordTarget[];
          const mainTarget = targets.find((t) => t.type === "page" || t.title.includes("Discord"));
          if (!mainTarget) {
            return reject(new Error("Discord window target not found via CDP."));
          }
          resolve(mainTarget);
        } catch (err) {
          reject(err);
        }
      });
    }).on("error", (err) => {
      reject(new Error(`Failed to connect to Discord CDP port ${port}. Is Discord running with --remote-debugging-port=${port}? Details: ${err.message}`));
    });
  });
}

export async function executeInDiscord(script: string, port = 9222): Promise<any> {
  const target = await getDiscordDebugTarget(port);
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  return new Promise((resolve, reject) => {
    const id = 1;
    ws.on("open", () => {
      const msg = {
        id,
        method: "Runtime.evaluate",
        params: {
          expression: script,
          awaitPromise: true,
          returnByValue: true,
        },
      };
      ws.send(JSON.stringify(msg));
    });

    ws.on("message", (raw) => {
      try {
        const res = JSON.parse(raw.toString());
        if (res.id === id) {
          ws.close();
          if (res.result?.exceptionDetails) {
            reject(new Error(res.result.exceptionDetails.exception?.description || "Runtime evaluation error"));
          } else {
            resolve(res.result?.result?.value);
          }
        }
      } catch (e) {
        ws.close();
        reject(e);
      }
    });

    ws.on("error", (err) => reject(err));
  });
}
