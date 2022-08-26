import axios from 'axios';
import randomatic from 'randomatic';
import Logger from './logger';

type Params = {
  target: string;
  logger: Logger;
  tag?: string;
}

export async function sendRequest(params: Params) {
  const { target, tag, logger } = params;
  const url = makeTargetUrl(target, makeRequestId(tag));

  try {
    await axios.get(url);
    logger.verbose(`sent: GET ${url}`);
  } catch (error: any) {
    logger.error(error.message);
  }
}

function makeTargetUrl(target: string, id: string) {
  const url = new URL(target);
  url.searchParams.append('tfk', id);
  return url.toString();
}

function makeRequestId(tag?: string) {
  const suffix = tag ? `-${tag}` : '';
  return `${process.pid}-${randomatic('A0', 16)}${suffix}`;
}