// This is the server's entry point, i.e. main function in C based languages.
import config from 'config';
import connect from './utils/connect';
import logger from './utils/logger';
import createServer from './utils/server';

const app = createServer();

const port = config.get<number>('port');

app.listen(port, async () => {
  logger.info('Server is running at http://localhost:%d in %s mode', port, app.get('env'));

  await connect();
});