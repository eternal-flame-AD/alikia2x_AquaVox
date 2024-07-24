import { safePath } from '$lib/server/safePath';
import { getCurrentFormattedDateTime } from '$lib/songUpdateTime';
import { json, error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function GET({ params }) {
    const filePath = safePath(`${params.id}.json`, { base: './data/song' });
    if (!filePath) {
        return error(404, {
            message: "No correspoding song."
        });
    }
    let data;
    try { data = fs.readFileSync(filePath); } catch (e) {
        return error(404, {
            message: "No correspoding song."
        });
    }
    return json(JSON.parse(data.toString()));
}

export async function POST({ params, request }) {
    const timeStamp = new Date().getTime();
    try {
        if (!fs.existsSync("./data/pending/")) {
            fs.mkdirSync("./data/pending", { mode: 0o755 });
        }
        const filePath = `./data/pending/${params.id}-${timeStamp}.json`;
        const data: MusicMetadata = await request.json();
        data.updateTime = getCurrentFormattedDateTime();
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), { mode: 0o644 });
        return json({
            "message": "successfully created"
        }, {
            status: 201
        });
    } catch (e) {
        return error(500, {
            message: "Internal server error."
        });
    }
}