import { Exec } from './Common';

export class Camera
{
	public capture( file: string )
	{
		return Exec( 'fswebcam --no-banner ' + file );
	}
}
