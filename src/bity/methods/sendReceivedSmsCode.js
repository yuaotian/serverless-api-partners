import configs from '../config';
import request from '../bityRequestOnlyStatusResponse';
import { error, success } from '../../response';
import SimpleEncryptor from 'simple-encryptor';

const encryptor = new SimpleEncryptor(configs.encryptionKey);
const formatResponse = order => {
  return {success: order.statusCode === 204};
};
export default body => {
  return new Promise((resolve, reject) => {
    if (
      !configs.fiatValues[body.params.pair] ||
      !configs.fiatValues[body.params.pair].active
    ) {
      return reject(error('Not supported', body.id));
    }
    const phoneToken = encryptor.decrypt(body.params.phoneToken);
    const req = {
      url: configs.API_URL + configs.EXIT_TO_FIAT_LOGIN_URL,
      headers: {'X-Phone-Token': phoneToken}
    };
    const reqBody = {
      tan: body.params.tan
    };
    request(req, reqBody)
      .then(result => {
        resolve(
          success({
            jsonrpc: '2.0',
            result: formatResponse(result),
            id: body.id
          })
        );
      })
      .catch(err => {
        reject(error(err, ''));
      });
  });
};
