import { Exec } from './Common';

export class Camera
{
	public capture( file: string )
	{
		return Exec( 'fswebcam --skip 40 --no-banner ' + file );
	}
}
