const fetch = require('isomorphic-fetch');
const dhive = require('@hiveio/dhive');
require('dotenv').config();

const { submissionUrl, author, postingKey, footer, tags } = require('./config');

const client = new dhive.Client([
  'https://api.hive.blog',
  'https://api.openhive.network',
  'https://anyx.io',
  'https://hived.privex.io',
  'https://rpc.ausbit.dev',
  'https://techcoderx.com',
  'https://hived.emre.sh',
  'https://api.deathwing.me',
  'https://api.c0ff33a.uk'
]);

const privateKey = dhive.PrivateKey.fromString(postingKey);

const sanitizeString = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const processSubmission = async (submission) => {
  try {
    const isVideo = submission.type === 'creation' && submission.mediaMetadata && submission.mediaMetadata.type === 'video';
    const thumbnailUrl = isVideo ? submission.thumbnailUrl : submission.imageUrl;
    const bodyContent = isVideo ? `<iframe src="${submission.url}"></iframe>` : '';
    const defaultFooter = `${footer}\n\n![Thumbnail](${thumbnailUrl})`;

    const title = submission.name;
    const maxLength = 255; // Maximum permlink length
    const permlink = sanitizeString(title.slice(0, maxLength));
    const body = `${bodyContent}\n\n${defaultFooter}`;

    const postObject = {
      parent_author: '',
      parent_permlink: 'hive-173115', // Update the parent permlink accordingly
      author: author,
      permlink: permlink,
      title: title,
      body: body,
      json_metadata: JSON.stringify({ tags: tags })
    };

    console.log("postObject:", postObject);
    console.log("postingKey:", postingKey);

    // Uncomment the following line to test the broadcasting of the comment
    const result = await client.broadcast.comment(postObject, privateKey);
    console.log("Post successful:", result);
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

fetch(submissionUrl)
  .then(response => response.json())
  .then(data => {
    const submission = data[0]; // Assuming the response is an array with a single submission object
    processSubmission(submission);
  })
  .catch(error => {
    console.error('An error occurred:', error);
  });
