<?php
	$sender = $argv[1];
	$to 	= $argv[2];
	$msg 	= $argv[3];
	$subject =$argv[4];
	// 
	// Composing mail
	//
	$from    = "Sean.Yang@alcatel-lucent.com";

	$headers  = "MIME-Version: 1.0\r\n";
	$headers .= "Content-type: text/html; charset=iso-8859-1\r\n";
	$headers .= "From: ".$sender." <sean.yang@alcatel-lucent.com>\r\n";

	mail($to, $subject, $msg, $headers, "-f sean.yang@alcatel-lucent.com" );

	echo "Done";

?>