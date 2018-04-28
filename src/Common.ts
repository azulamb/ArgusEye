import { exec } from 'child_process';

export function Exec( command: string )
{
	return new Promise<{ stdout: string, stderr: string }>( ( resolve, reject ) =>
	{
		exec( command, ( error, stdout, stderr ) =>
		{
			if ( error ) { return reject( error ); }
			resolve( { stdout: stdout, stderr: stderr } );
		} );
	} );
}
