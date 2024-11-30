import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { AppDataSource } from './data-source';
import accountRoutes from './routes/account';
import adminRoutes from './routes/admin';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

morgan.token('ip', (req: express.Request) => req.connection.remoteAddress || 'N/A');
morgan.token('api-key', (req: express.Request) => {
    const apiKey = req.headers['api-key'];
    return Array.isArray(apiKey) ? apiKey.join(', ') : apiKey || 'N/A';
});
morgan.token('body', (req: express.Request) => JSON.stringify(req.body));
morgan.token('res-body', (req, res: any) => res.locals?.body || 'N/A');

const statusDescriptions: { [key: number]: string } = {
    200: 'OK',
    201: 'Created',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
};

morgan.token('status-desc', (req, res) => {
    const status = res.statusCode;
    return `${statusDescriptions[status] || 'Unknown Status'}`;
});

const green = '\x1b[38;2;202;247;107m';
const yellow = '\x1b[38;2;250;219;151m';
const red = '\x1b[38;2;255;99;71m';
const info = '\x1b[38;2;135;206;250m';
const reset = '\x1b[0m';

const morganFormat = `
${green}:method${reset} 
${yellow}:url${reset} 
${red}:status${reset} - ${info}:status-desc
${yellow}- Delay: ${info}:response-time ms 
${yellow}- IP: ${info}:ip${reset} 
${yellow}- API Key: ${red}:api-key 
${yellow}- Body: ${info}:body
${yellow}- Response: ${info}:res-body
`;

app.use(cors());
app.use(bodyParser.json());
app.use((req, res: any, next) => {
    const oldJson = res.json;
    res.json = function (body: any) {
        res.locals = res.locals || {};
        res.locals.body = JSON.stringify(body);
        return oldJson.apply(res, arguments);
    };
    next();
});
app.use(morgan(morganFormat));

app.use('/api/v2/account', accountRoutes);
app.use('/api/v2/admin', adminRoutes);

AppDataSource.initialize().then(() => {
    const green = '\x1b[38;2;202;247;107m';
    const yellow = '\x1b[38;2;250;219;151m';
    const reset = '\x1b[0m';
    app.listen(PORT, () => console.log(`${green}[SUPERSTUDY] ${yellow}Backend is now running on port ${PORT}${reset}`));
}).catch(error => console.log('SuperStudy Backend failed to start. Check Mongo Database.', error));