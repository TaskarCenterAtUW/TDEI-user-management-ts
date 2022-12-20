import { AppHttpResponseMeta } from './app-http-response-meta.model';
import { AppHttpResponseError } from './app-http-response-error.model';

/**
 * Represents an application http-response's body in case of success or even failure.
 */
export interface AppHttpResponse {
  /**
   * Gets or sets the data that requested or created by the user.
   *
   * This property will has a value only if the request was succeeded.
   */
  data?: unknown;

  /**
   * Gets or sets the metadata for the http response.
   */
  meta?: AppHttpResponseMeta;
}
