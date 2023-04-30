const nodeFetch = require('node-fetch');
const { decode } = require('html-entities');
const { parseHTML } = require('linkedom');

const oneSharhById = require('./dorarOneSharhById');
const cache = require('./cache');

module.exports = async (text, req, next) => {
  try {
    let url = `https://www.dorar.net/hadith/search?q=${text}`;
    if (req.tab === 'specialist') url += '&all';

    if (cache.has(url)) return cache.get(url);

    const res = await nodeFetch(url);
    const html = decode(await res.text());
    const doc = parseHTML(html).document.querySelector(`#${req.tab}`);

    const sharhId = doc
      .querySelector('a[xplain]')
      ?.getAttribute('xplain');

    const result = await oneSharhById(sharhId, req, next);

    cache.set(url, result);

    return result;
  } catch (err) {
    next(new Error(err));
  }
};
