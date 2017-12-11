

Usage

```js
var thumby = require('get-video-thumb');
	thumby('https://www.youtube.com/watch?v=w8UUGS2u9Z0', nodeback);
var nodeback = function(err, res) {console.log(res)};
```

Url formats that work:

* https://www.youtube.com/watch?v= __videoId__
* https://vimeo.com/ __videoId__
* https://www.facebook.com/ __user__ /videos/ __videoId__ /

Non-HTTPS urls will throw!