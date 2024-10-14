import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { config } from "dotenv";
import rateLimit from 'express-rate-limit';

config();

const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
};

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 1,
    handler: (_req, res) => {
        res.status(429).send('Too many requests from this IP, please try again later.');
    }
});

const handler = async (req: VercelRequest, res: VercelResponse) => {
    const discordBotToken = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_CHANNEL_ID;

    // Apply rate limiting
    limiter(req, res, async () => {
        try {
            const name = capitalizeWords(req.body.name);
            const team = req.body.team;
            const sanitizedContact = req.body.contact.replace(/[\s-]/g, '_');
            const threadResponse = await axios.post(
                `https://discord.com/api/v9/channels/${channelId}/threads`,
                {
                    name: `New Trade Request: ${name} From ${team}`,
                    auto_archive_duration: 10080,
                    type: 11
                },
                {
                    headers: {
                        'Authorization': `Bot ${discordBotToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const threadId = threadResponse.data.id;
            // Send the form data as an embed to the created thread
            const embed = {
                title: "New Trade Request",
                description: `
                    \`${name}\` from \`${team}\` would like to trade \`${req.body.offer}\` for \`${req.body.tradeFor}\`.
                    **Contact Information:** [REDACTED]
                `,
                color: 3447003
            };

            const components = [
                {
                    type: 1, // Action row
                    components: [
                        {
                            type: 2, // Button
                            style: 1, // Primary style
                            label: "Trade",
                            custom_id: `Trading_${sanitizedContact}`
                        }
                    ]
                }
            ];

            await axios.post(
                `https://discord.com/api/v9/channels/${threadId}/messages`,
                {
                    embeds: [embed],
                    components: components
                },
                {
                    headers: {
                        'Authorization': `Bot ${discordBotToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            res.status(200).send('Message sent');
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send({ error: 'Server Error', details: error});
        }
    });
};

module.exports = handler;
