export const LIST_QUESTS_SCRIPT = `
(() => {
    delete window.$;
    let wpRequire = webpackChunkdiscord_app.push([[Symbol()], {}, (r) => r]);
    webpackChunkdiscord_app.pop();

    let questsStore = null;
    for (const i in wpRequire.c) {
        const m = wpRequire.c[i]?.exports;
        if (!m) continue;
        const targets = [m.Z, m.ZP, m.default, m.Ay, m.Bo, m.tn, m.A, m].filter(t => t && typeof t === 'object');
        for (const t of targets) {
            try {
                if (t.quests && t.quests instanceof Map && t.quests.size > 0) {
                    questsStore = t;
                    break;
                }
            } catch(e) {}
        }
        if (questsStore) break;
    }

    if (!questsStore) return { error: "QuestsStore not found" };

    const rawList = Array.from(questsStore.quests.values());
    return rawList.map(q => {
        const tc = q.config?.taskConfig ?? q.config?.taskConfigV2;
        const taskName = ["WATCH_VIDEO", "PLAY_ON_DESKTOP", "STREAM_ON_DESKTOP", "PLAY_ACTIVITY"].find(x => tc?.tasks?.[x] != null) || "UNKNOWN";
        const target = tc?.tasks?.[taskName]?.target ?? 0;
        const progress = q.userStatus?.progress?.[taskName]?.value ?? 0;

        return {
            id: q.id,
            name: q.config?.messages?.questName || q.config?.application?.name || "Unknown",
            applicationId: q.config?.application?.id,
            enrolledAt: q.userStatus?.enrolledAt,
            completedAt: q.userStatus?.completedAt,
            taskName,
            targetSeconds: target,
            progressSeconds: progress,
            canClaim: q.userStatus?.enrolledAt && !q.userStatus?.completedAt && progress >= target && target > 0
        };
    });
})();
`;

export function generateSpoofScript(questId: string): string {
  return `
(() => {
    delete window.$;
    let wpRequire = webpackChunkdiscord_app.push([[Symbol()], {}, (r) => r]);
    webpackChunkdiscord_app.pop();

    const findModule = (filter) => {
        for (const i in wpRequire.c) {
            const m = wpRequire.c[i]?.exports;
            if (!m) continue;
            const targets = [m.Z, m.ZP, m.default, m.Ay, m.Bo, m.tn, m.A, m].filter(t => t && typeof t === 'object');
            for (const t of targets) {
                try { if (filter(t)) return t; } catch(e) {}
            }
        }
    };

    const runningGameStore = findModule(m => m.getRunningGames);
    const fluxDispatcher = findModule(m => m.flushWaitQueue);

    let questsStore = null;
    for (const i in wpRequire.c) {
        const m = wpRequire.c[i]?.exports;
        if (!m) continue;
        const targets = [m.Z, m.ZP, m.default, m.Ay, m.Bo, m.tn, m.A, m].filter(t => t && typeof t === 'object');
        for (const t of targets) {
            try {
                if (t.quests && t.quests instanceof Map && t.quests.size > 0) {
                    questsStore = t;
                    break;
                }
            } catch(e) {}
        }
        if (questsStore) break;
    }

    if (!questsStore) return { success: false, error: "QuestsStore not found" };

    const quest = questsStore.quests.get("${questId}");
    if (!quest) return { success: false, error: "Quest with ID ${questId} not found" };

    const appId = quest.config?.application?.id || quest.config?.applicationId;
    const appName = quest.config?.application?.name || quest.config?.messages?.questName || "Application";
    const taskConfig = quest.config?.taskConfig ?? quest.config?.taskConfigV2;
    const tasks = taskConfig?.tasks || {};
    const secondsNeeded = tasks?.PLAY_ON_DESKTOP?.target ?? 900;
    const secondsDone = quest.userStatus?.progress?.PLAY_ON_DESKTOP?.value ?? 0;

    const fakeGame = {
        cmdLine: "C:\\\\Program Files\\\\" + appName + "\\\\game.exe",
        exeName: "game.exe",
        exePath: "c:/program files/" + appName.toLowerCase() + "/game.exe",
        hidden: false,
        isLauncher: false,
        id: appId,
        name: appName,
        pid: 1337,
        pidPath: [1337],
        processName: "game.exe",
        start: Date.now(),
    };

    const realGames = runningGameStore.getRunningGames();
    const fakeGames = [fakeGame];
    const realGetRunningGames = runningGameStore.getRunningGames;
    const realGetGameForPID = runningGameStore.getGameForPID;

    runningGameStore.getRunningGames = () => fakeGames;
    runningGameStore.getGameForPID = (p) => fakeGames.find(x => x.pid === p);
    fluxDispatcher.dispatch({type: "RUNNING_GAMES_CHANGE", removed: realGames, added: [fakeGame], games: fakeGames});

    let fn = data => {
        let progress = quest.config?.configVersion === 1 ? data.userStatus?.streamProgressSeconds : Math.floor(data.userStatus?.progress?.PLAY_ON_DESKTOP?.value || 0);
        if (progress >= secondsNeeded) {
            runningGameStore.getRunningGames = realGetRunningGames;
            runningGameStore.getGameForPID = realGetGameForPID;
            fluxDispatcher.dispatch({type: "RUNNING_GAMES_CHANGE", removed: [fakeGame], added: [], games: []});
            fluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
        }
    };

    fluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

    return {
        success: true,
        questId: "${questId}",
        appName,
        targetSeconds: secondsNeeded,
        progressSeconds: secondsDone,
        remainingMinutes: Math.ceil((secondsNeeded - secondsDone) / 60)
    };
})();
`;
}
