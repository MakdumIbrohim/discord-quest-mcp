import http from "node:http";
import WebSocket from "ws";
import { DiscordTarget } from "../types/index.js";
import { DEFAULT_CONFIG } from "../config/constants.js";

export class CdpClient {
  constructor(private port: number = DEFAULT_CONFIG.DEFAULT_CDP_PORT) {}

  public async getDebugTarget(): Promise<DiscordTarget> {
    return new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${this.port}/json`, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const targets = JSON.parse(data) as DiscordTarget[];
            const mainTarget = targets.find((t) => t.type === "page" || t.title.includes("Discord"));
            if (!mainTarget) {
              return reject(new Error("Target window Discord tidak ditemukan via CDP."));
            }
            resolve(mainTarget);
          } catch (err) {
            reject(err);
          }
        });
      }).on("error", (err) => {
        reject(new Error(`Gagal terhubung ke Discord port ${this.port}. Pastikan Discord berjalan dengan --remote-debugging-port=${this.port}. Detail: ${err.message}`));
      });
    });
  }

  public async evaluate<T = any>(script: string): Promise<T> {
    const target = await this.getDebugTarget();
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    return new Promise((resolve, reject) => {
      const id = Date.now();
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
}
