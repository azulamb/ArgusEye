//import * as twitter from 'twitter';
const Twitter = require('twitter');

export function TwitterMediaUpload( consumer_key: string, consumer_secret: string, access_token_key: string, access_token_secret: string, tweet: string, data: Buffer )
{
	const client = new Twitter(
	{
		consumer_key: consumer_key,
		consumer_secret: consumer_secret,
		access_token_key: access_token_key,
		access_token_secret: access_token_secret,
	} );

	//var data = require('fs').readFileSync('image.jpg');

	return new Promise( ( resolve, reject) =>
	{
		client.post('media/upload', { media: data }, ( error: Error, media: { media_id_string: string }, response: any ) =>
		{
			if ( error ) { return reject( error ); }

console.log(media);
console.log( response );

			const status =
			{
				status: tweet,
				media_ids: media.media_id_string,
			}

			client.post( 'statuses/update', status, ( error: Error, tweet: any, response: any ) =>
			{
				if ( error ) { return reject( error ); }
console.log( tweet );
console.log( response );
				resolve( tweet );
			} );
		} );
	} ).then( ( tweet ) =>
	{
		return 'OK';
	} );
}
