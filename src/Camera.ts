import { Exec } from './Common';
import * as fs from 'fs';

export class Camera
{
	public capture( file: string ): Promise<{ stdout: string, stderr: string }>
	{
		return Exec( 'fswebcam --skip 40 --no-banner ' + file ).then( ( data ) =>
		{
			const stat = fs.statSync( file );
			if ( !stat || stat.size < 10000 ) { return this.capture( file ); }
			return Promise.resolve( data );
		} );
	}
}
