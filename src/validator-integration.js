/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {getMode} from './mode';


/**
 * Triggers validation for the current document if there is a script in the
 * page that has a "development" attribute.
 *
 * @param {!Window} win Destination window for the new element.
 */
export function maybeValidate(win) {
  if (!getMode().development) {
    return;
  }
  var filename = win.location.href;
  var s = document.createElement('script');
  // TODO(@cramforce): Switch to locally build version when we integrated
  // the validator and switch to production URL.
  s.src = 'https://www.gstatic.com/amphtml/v0/validator.js';
  s.onload = () => {
    win.document.head.removeChild(s);
    // TODO(@gregable): Move all of this into the validator for a simple API
    // like: amp.validator.validateAndRender(url);
    // Also, most switch to something different from fetch, so this works in
    // Safari.
    fetch(filename).then((response) => {
      return response.text();
    }).then((html) => {
      var result = win.amp.validator.renderValidationResult(
          win.amp.validator.validateString(html), filename);
      var status = result.shift();
      if (status == 'PASS') {
        console.info('AMP validation successful.');
      } else if (status == 'UNKNOWN') {
        console.error('AMP validation yielded unknown status.');
      } else {
        console.error('AMP validation had errors:');
      }
      result.forEach((message) => {
        console.error(message);
      });
    });
  };
  win.document.head.appendChild(s);
}
