import { exec } from 'child_process';

export function Exec( command: string )
{
	return new Promise<{ stdout: string, stderr: string }>( ( resolve, reject ) =>
	{
		console.log( command );
		exec( command, ( error, stdout, stderr ) =>
		{
			console.log( error );
			if ( error ) { return reject( error ); }
			resolve( { stdout: stdout, stderr: stderr } );
		} );
	} );
}
