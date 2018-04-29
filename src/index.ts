import * as path from 'path';
import * as fs from 'fs';
import * as stream from 'stream';
import { Camera } from './Camera';
import { Movie } from './Movie';
import { TwitterMediaUpload } from './TwitterMediaUpload';

interface TOKEN { token: string, secret: string }
interface CONFIG { consumer: TOKEN, access: TOKEN }

function CreateBufferStream() { return new stream.Transform( { transform( chunk, encoding, callback ) { callback( null, chunk ); } } ); }

function LoadBinary( file: string )
{
	return new Promise<Buffer>( ( resolve, reject ) =>
	{
		const buftrans = CreateBufferStream();
		const bufs: Buffer[] = [];
		buftrans.on( 'data', ( chunk: Buffer ) => { bufs.push( chunk ); } );
		buftrans.on( 'end', () => { resolve( Buffer.concat( bufs ) ); } );
		buftrans.on( 'error', ( error ) => { reject( error ); } );

		fs.createReadStream( file ).pipe( buftrans );
	} );
}

function LoadJSON( file: string )
{
	return new Promise<string>( ( resolve, reject ) =>
	{
		fs.readFile( file, 'utf-8', ( error, data ) =>
		{
			if ( error ) { return reject(); }
			resolve( data );
		} );
	} ).catch( ( error ) => { return ''; } ).then( ( data ) =>
	{
		return JSON.parse( data );
	} );
}

function LoadConfig()
{
	return LoadJSON( './config.json' ).then( ( data ) =>
	{
		if ( typeof data !== 'object' ) { throw 'Type error'; }
		if ( typeof data.consumer !== 'object' || typeof data.access !== 'object' ) { throw 'Type error'; }
		if ( typeof data.consumer.token !== 'string' || typeof data.consumer.secret !== 'string' ||
			typeof data.consumer.token !== 'string' || typeof data.consumer.secret !== 'string' ) { throw 'Type error'; }
		return <CONFIG>data;
	} );
}

function LoadPicList( dir: string )
{
	console.log( dir );
	return new Promise<string[]>( ( resolve, reject ) =>
	{
		fs.readdir( dir, ( error, list ) =>
		{
			if ( error ) { return resolve( [] ); }

			const files: string[] = [];
			const p: Promise<string[]>[] = [];

			list.forEach( ( item ) =>
			{
				const fpath = path.join( dir, item );
				console.log( item, fpath );
				const stat = fs.statSync( fpath );
				if ( !stat ) { return; }
				if ( stat.isFile() && fpath.match( /\.jpg$/ ) ) { return files.push( fpath ); }
				if ( stat.isDirectory() ) { return p.push( LoadPicList( fpath ) ); }
			} );

			return Promise.all( p ).then( ( filelists ) =>
			{
				filelists.forEach( ( indir ) => { files.push( ...indir ); } );
				return resolve( files );
			} );
		} );
	} );
}

function CreateDir( ...dir: string[] )
{
	let create = false;
	return dir.reduce( ( prev, next ) =>
	{
		return prev.then( ( dir ) =>
		{
			return new Promise<string>( ( resolve, reject ) =>
			{
				const dirpath = path.join( dir, next );
				fs.mkdir( dirpath, '0757', ( error ) =>
				{
					if ( error )
					{
						if ( error.code !== 'EEXIST' ) { return reject( { error: error } ); }
					} else { create = true; }
					resolve( dirpath );
				} );
			} );
		} );
	}, Promise.resolve( '' ) ).then( ( dir ) =>
	{
		return { dir: dir, create: create };
	} );
}

function Init()
{
	const date = new Date();
	return Promise.resolve(
	{
		date: date,
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		day: date.getDate(),
		hours: date.getHours(),
		minutes: date.getMinutes(),
		seconds: date.getSeconds(),
		dir: '',
		create: false,
	} ).then( ( data ) =>
	{
		return CreateDir( 'pics', [ data.year, Z( data.month ), Z( data.day ) ].join( '' ), Z( data.hours ) ).then( ( info ) =>
		{
			data.dir = info.dir;
			data.create = info.create;
			return data;
		} );
	} );
}

function Z( value: number ) { return ('0' + value).slice( -2 ); }

Init().then( ( data ) =>
{
console.log( data );
	const camera = new Camera();
	return camera.capture( path.join( data.dir, [ Z( data.minutes ), '.jpg' ].join( '' ) ) ).then( () =>
	{
		return data;
	} );
} ).then( ( data ) =>
{
	if ( !data.create ) { return Promise.resolve(); }
	// Mode ... day or 1h.
	let dir = '';
	if ( data.hours === 0 && data.minutes < 5 )
	{
		// Day
		dir = path.join( data.dir, '..' );
	} else
	{
		// Hour
		if ( 0 < data.hours )
		{
			// Before 1hour.
			dir = path.join( 'pics', [ data.year, Z( data.month ), Z( data.day ) ].join( '' ), Z( data.hours - 1 ) );
		} else
		{
			// Yesterday 2300~2359
			const date = new Date( data.date.getTime() - 65 * 60 * 1000 );
			dir = path.join( 'pics', [ date.getFullYear(), Z( date.getMonth() + 1 ), Z( date.getDate() ) ].join( '' ), '23' );
		}
	}
	return LoadPicList( dir ).then( ( files ) =>
	{
		console.log( files );
		const movie = new Movie();
		return movie.create( files );
	} ).then( ( movie ) =>
	{
		if ( !movie ) { return Promise.resolve( '' ); }
		return LoadConfig().then( ( config ) =>
		{
			return TwitterMediaUpload(
				config.consumer.token, config.consumer.secret,
				config.access.token, config.access.secret,
				'test', movie );
			/*return LoadBinary( movie ).then( ( data ) =>
			{
				return TwitterMediaUpload(
					config.consumer.token, config.consumer.secret,
					config.access.token, config.access.secret,
					'test', data );
			} );*/
		} )
	} ).then( () =>
	{
		console.log( 'complete' );
	} );
} ).catch( ( error ) => { console.log( 'Error:', error ); } );
