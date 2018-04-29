import { Exec } from './Common';

export class Movie
{

	public create( files: string[] )
	{
		console.log( 'Create Movie.' );
		if ( files.length <= 0 ) { return Promise.resolve( {} ); }
		return Exec( 'rm -rf ~/tmp_mv/' ).then( () =>
		{
			return Exec( 'mkdir ~/tmp_mv/' );
		} ).then( () =>
		{
			files.sort();
			let count = 0;
			const p = files.map( ( file ) => { return Exec( 'cp ' + file + ' ~/tmp_mv/' + ('0000' + ( ++count ) ).slice( -4 ) + '.jpg' ) } );
			return Promise.all( p );
		} ).then( () =>
		{
			return Exec( 'ffmpeg -r 5 -i ~/tmp_mv/%04d.jpg ./movie.mp4' );
		} );
	}
}