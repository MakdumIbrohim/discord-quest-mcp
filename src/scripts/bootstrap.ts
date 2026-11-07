export const WEBPACK_DISCORD_BOOTSTRAP = `
delete window.$;
let wpRequire = webpackChunkdiscord_app.push([[Symbol()], {}, (r) => r]);
webpackChunkdiscord_app.pop();

let rgs = null;
let questsStore = null;
let api = null;
let claimFn = null;

for (const i in wpRequire.c) {
    const m = wpRequire.c[i]?.exports;
    if (!m) continue;
    const targets = [m.Z, m.ZP, m.default, m.Ay, m.Bo, m.tn, m.A, m].filter(t => t && typeof t === "object");
    for (const t of targets) {
        try {
            if (t.getName) {
                const name = t.getName();
                if (name === "RunningGameStore") rgs = t;
                if (name === "QuestStore") questsStore = t;
            }
            if (t.get && t.post && !api) api = t;
        } catch(e) {}
    }
    for (const k in m) {
        try {
            if (typeof m[k] === "function" && m[k].toString().includes("QUESTS_CLAIM_REWARD_BEGIN")) {
                claimFn = m[k];
            }
        } catch(e) {}
    }
}
`;
