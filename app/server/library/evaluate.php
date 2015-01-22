<?php 

	error_reporting(E_ERROR);

	$regex = $argv[1];
	$context = $argv[2];
	// 
	// decoding regex sgtring
	// 
	$regex = preg_replace('/_bs_/', "\\", $regex);
	$regex = preg_replace('/_fs_/', "/", $regex);
	$regex = preg_replace('/_space_/', " ", $regex);
	$regex = preg_replace('/_ob_/', "(", $regex);
	$regex = preg_replace('/_cb_/', ")", $regex);
	$regex = preg_replace('/_qm_/', "?", $regex);
	$regex = preg_replace('/_cl_/', ":", $regex);
	$regex = preg_replace('/_plus_/', "+", $regex);
	$regex = preg_replace('/_aob_/', "<", $regex);
	$regex = preg_replace('/_acb_/', ">", $regex);
	$regex = preg_replace('/_sob_/', "[", $regex);
	$regex = preg_replace('/_scb_/', "]", $regex);
	$regex = preg_replace('/_cob_/', "{", $regex);
	$regex = preg_replace('/_ccb_/', "}", $regex);
	$regex = preg_replace('/_dot_/', ".", $regex);
	$regex = preg_replace('/_star_/', "*", $regex);
	$regex = preg_replace('/_cma_/', ",", $regex);
	$regex = preg_replace('/_bar_/', "|", $regex);
	$regex = preg_replace('/_dq_/', "\"", $regex);
	$regex = preg_replace('/_sq_/', "'", $regex);


// echo "$context\n\n";
	if (preg_match_all("/".$regex."/i", $context, $matches)) {
		// $matches[100] = $regex;
		foreach($matches as $key => $match) {
			if (is_int($key)) {
				unset($matches[$key]);
			}
		}
		// print_r($matches);
		echo json_encode($matches);
	} else {
		echo json_encode(null);
	}

?>

