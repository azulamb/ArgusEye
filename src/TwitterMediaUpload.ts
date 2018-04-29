const fs = require('fs');
const Twit = require('twit');

export function TwitterMediaUpload( consumer_key: string, consumer_secret: string, access_token_key: string, access_token_secret: string, tweet: string, movie: string )
{
	const T = new Twit(
	{
		consumer_key:         consumer_key,
		consumer_secret:      consumer_secret,
		access_token:         access_token_key,
		access_token_secret:  access_token_secret,
	} );

	console.log( consumer_key, consumer_secret, access_token_key, access_token_secret, tweet, movie );

	return new Promise( ( resolve, reject ) =>
	{
		T.postMediaChunked( { file_path: movie }, ( error: Error, data: any, response: any ) =>
		{
console.log( data );
			if ( error ) { return reject( error ); }

			const mediaIdStr = data.media_id_string;
			const meta_params = { media_id: mediaIdStr };

			T.post( 'media/metadata/create', meta_params, ( error: Error, data: any, response: any ) =>
			{
console.log( data );
				if ( error ) { return reject( error ); }

				const params = { status: tweet, media_ids: [mediaIdStr] };

				T.post( 'statuses/update', params, ( error: Error, tweet: any, response: any ) =>
				{
					console.log(tweet);
					resolve( tweet.id_str );
				} );
			} );
		} );
	} );
}

//import * as twitter from 'twitter';
/*const Twitter = require('twitter');

export function TwitterMediaUpload( consumer_key: string, consumer_secret: string, access_token_key: string, access_token_secret: string, tweet: string, data: Buffer )
{
	console.log( 'Twitter upload.' );
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
console.log( error );
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
}*/
