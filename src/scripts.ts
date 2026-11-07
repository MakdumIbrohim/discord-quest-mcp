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
                if (t.getName && t.getName() === "QuestStore") {
                    questsStore = t;
                    break;
                }
            } catch(e) {}
        }
        if (questsStore) break;
    }

    if (!questsStore) return { error: "QuestStore not found" };

    const rawList = Array.from(questsStore.quests.values());
    return rawList.map(q => {
        const tc = q.config?.taskConfig ?? q.config?.taskConfigV2;
        const taskName = ["WATCH_VIDEO", "PLAY_ON_DESKTOP", "STREAM_ON_DESKTOP", "PLAY_ACTIVITY"].find(x => tc?.tasks?.[x] != null) || "UNKNOWN";
        const target = tc?.tasks?.[taskName]?.target ?? 0;
        const progress = q.userStatus?.progress?.[taskName]?.value ?? q.userStatus?.streamProgressSeconds ?? 0;

        return {
            id: q.id,
            name: q.config?.messages?.questName || q.config?.application?.name || "Unknown",
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

    let rgs = null;
    let questsStore = null;

    for (const i in wpRequire.c) {
        const m = wpRequire.c[i]?.exports;
        if (!m) continue;
        const targets = [m.Z, m.ZP, m.default, m.Ay, m.Bo, m.tn, m.A, m].filter(t => t && typeof t === 'object');
        for (const t of targets) {
            try {
                if (t.getName) {
                    const name = t.getName();
                    if (name === "RunningGameStore") rgs = t;
                    if (name === "QuestStore") questsStore = t;
                }
            } catch(e) {}
        }
        if (rgs && questsStore) break;
    }

    if (!rgs || !questsStore) return { success: false, error: "Stores not found" };

    const quest = questsStore.quests.get("${questId}");
    if (!quest) return { success: false, error: "Quest not found" };

    const tc = quest.config?.taskConfig ?? quest.config?.taskConfigV2;
    const appId = tc?.tasks?.PLAY_ON_DESKTOP?.applications?.[0]?.id || quest.config?.application?.id || quest.config?.applicationId;
    const appName = quest.config?.messages?.questName || quest.config?.application?.name || "Game";
    const targetSeconds = tc?.tasks?.PLAY_ON_DESKTOP?.target ?? 900;
    const progressSeconds = quest.userStatus?.progress?.PLAY_ON_DESKTOP?.value ?? quest.userStatus?.streamProgressSeconds ?? 0;

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
        start: Date.now()
    };

    rgs.getRunningGames = () => [fakeGame];
    rgs.getGameForPID = () => fakeGame;

    rgs._dispatcher.dispatch({
        type: "RUNNING_GAMES_CHANGE",
        removed: [],
        added: [fakeGame],
        games: [fakeGame]
    });

    return {
        success: true,
        questId: "${questId}",
        appName,
        targetSeconds,
        progressSeconds
    };
})();
`;
}

export const AUTO_COMPLETE_ALL_SCRIPT = `
(() => {
    delete window.$;
    let wpRequire = webpackChunkdiscord_app.push([[Symbol()], {}, (r) => r]);
    webpackChunkdiscord_app.pop();

    let rgs = null;
    let questsStore = null;

    for (const i in wpRequire.c) {
        const m = wpRequire.c[i]?.exports;
        if (!m) continue;
        const targets = [m.Z, m.ZP, m.default, m.Ay, m.Bo, m.tn, m.A, m].filter(t => t && typeof t === 'object');
        for (const t of targets) {
            try {
                if (t.getName) {
                    const name = t.getName();
                    if (name === "RunningGameStore") rgs = t;
                    if (name === "QuestStore") questsStore = t;
                }
            } catch(e) {}
        }
        if (rgs && questsStore) break;
    }

    if (!rgs || !questsStore) return { error: "Required Discord Stores not found" };

    const dispatcher = rgs._dispatcher;
    const rawList = Array.from(questsStore.quests.values());
    const enrolledDesktopQuests = rawList.filter(q => {
        const tc = q.config?.taskConfig ?? q.config?.taskConfigV2;
        return q.userStatus?.enrolledAt && !q.userStatus?.completedAt && tc?.tasks?.PLAY_ON_DESKTOP != null;
    });

    if (enrolledDesktopQuests.length === 0) {
        return { message: "Tidak ada desktop quest aktif yang belum selesai." };
    }

    const fakeGames = enrolledDesktopQuests.map((q, idx) => {
        const tc = q.config?.taskConfig ?? q.config?.taskConfigV2;
        const appId = tc.tasks.PLAY_ON_DESKTOP.applications?.[0]?.id || q.config?.application?.id || q.config?.applicationId;
        const appName = q.config?.messages?.questName || q.config?.application?.name || "Game";

        return {
            cmdLine: "C:\\\\Program Files\\\\" + appName + "\\\\game.exe",
            exeName: "game.exe",
            exePath: "c:/program files/" + appName.toLowerCase() + "/game.exe",
            hidden: false,
            isLauncher: false,
            id: appId,
            name: appName,
            pid: 1400 + idx,
            pidPath: [1400 + idx],
            processName: "game.exe",
            start: Date.now()
        };
    });

    rgs.getRunningGames = () => fakeGames;
    rgs.getGameForPID = (p) => fakeGames.find(x => x.pid === p);

    dispatcher.dispatch({
        type: "RUNNING_GAMES_CHANGE",
        removed: [],
        added: fakeGames,
        games: fakeGames
    });

    return {
        status: "RUNNING_IN_BACKGROUND",
        totalSimulated: fakeGames.length,
        quests: enrolledDesktopQuests.map(q => ({
            id: q.id,
            name: q.config?.messages?.questName || q.config?.application?.name,
            targetSeconds: (q.config?.taskConfig ?? q.config?.taskConfigV2)?.tasks?.PLAY_ON_DESKTOP?.target ?? 900
        }))
    };
})();
`;

export const FAST_FORWARD_VIDEOS_SCRIPT = `
(async () => {
    delete window.$;
    let wpRequire = webpackChunkdiscord_app.push([[Symbol()], {}, (r) => r]);
    webpackChunkdiscord_app.pop();

    let questsStore = null;
    let api = null;
    let claimFn = null;

    for (const i in wpRequire.c) {
        const m = wpRequire.c[i]?.exports;
        if (!m) continue;
        const targets = [m.Z, m.ZP, m.default, m.Ay, m.Bo, m.tn, m.A, m].filter(t => t && typeof t === "object");
        for (const t of targets) {
            try {
                if (t.getName && t.getName() === "QuestStore") questsStore = t;
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

    if (!questsStore || !api) return { error: "QuestStore or API not found" };

    const rawList = Array.from(questsStore.quests.values());
    const videoQuests = rawList.filter(q => {
        const tc = q.config?.taskConfig ?? q.config?.taskConfigV2;
        return tc?.tasks?.WATCH_VIDEO != null && !q.userStatus?.completedAt;
    });

    if (videoQuests.length === 0) {
        return { message: "Tidak ada video quest yang belum selesai." };
    }

    const results = [];
    for (const q of videoQuests) {
        const tc = q.config?.taskConfig ?? q.config?.taskConfigV2;
        const target = tc.tasks.WATCH_VIDEO.target;
        const name = q.config?.messages?.questName || q.config?.application?.name;

        try {
            if (!q.userStatus?.enrolledAt) {
                await api.post({ url: \`/quests/\${q.id}/enroll\`, body: { location: 11 } });
            }

            await api.post({
                url: \`/quests/\${q.id}/video-progress\`,
                body: { timestamp: target }
            });

            if (claimFn) {
                try {
                    await claimFn(q.id, 0, 11);
                } catch(e) {}
            }

            results.push({ id: q.id, name, status: "COMPLETED_AND_CLAIMED", targetSeconds: target });
        } catch(err) {
            results.push({ id: q.id, name, status: "FAILED", error: String(err) });
        }
    }

    return {
        totalProcessed: results.length,
        results
    };
})();
`;

export const AUTO_ENROLL_ALL_SCRIPT = `
(async () => {
    delete window.$;
    let wpRequire = webpackChunkdiscord_app.push([[Symbol()], {}, (r) => r]);
    webpackChunkdiscord_app.pop();

    let questsStore = null;
    let api = null;

    for (const i in wpRequire.c) {
        const m = wpRequire.c[i]?.exports;
        if (!m) continue;
        const targets = [m.Z, m.ZP, m.default, m.Ay, m.Bo, m.tn, m.A, m].filter(t => t && typeof t === "object");
        for (const t of targets) {
            try {
                if (t.getName && t.getName() === "QuestStore") questsStore = t;
                if (t.get && t.post && !api) api = t;
            } catch(e) {}
        }
    }

    if (!questsStore || !api) return { error: "QuestStore or API not found" };

    const rawList = Array.from(questsStore.quests.values());
    const unenrolledQuests = rawList.filter(q => {
        const isExpired = q.config?.expiresAt && new Date(q.config.expiresAt).getTime() <= Date.now();
        return !isExpired && !q.userStatus?.enrolledAt && !q.userStatus?.completedAt;
    });

    if (unenrolledQuests.length === 0) {
        return { message: "Semua quest aktif sudah ter-enroll (tidak ada quest baru yang terlewat)." };
    }

    const results = [];
    for (const q of unenrolledQuests) {
        const name = q.config?.messages?.questName || q.config?.application?.name || "Quest";
        try {
            await api.post({ url: \`/quests/\${q.id}/enroll\`, body: { location: 11 } });
            results.push({ id: q.id, name, status: "ENROLLED_SUCCESSFULLY" });
        } catch(err) {
            results.push({ id: q.id, name, status: "FAILED", error: String(err) });
        }
    }

    return {
        totalEnrolled: results.filter(r => r.status === "ENROLLED_SUCCESSFULLY").length,
        results
    };
})();
`;
