<?php 

	$table = $argv[1];
	$toReturn = array();

	mysql_connect(':/Applications/MAMP/tmp/mysql/mysql.sock', 'root' , 'tigris');
	@mysql_select_db('hct') or die( "Unable to select database");
	$query 	= "SELECT * FROM ".$table;


	$result = mysql_query($query);
	while($info = mysql_fetch_array($result)) {
		$cmd = $info['cmd'];
		$category = $info['category'];
		$content = $info['content'];
		$sigs = json_decode(decodeJSON($info['sigs']));

		foreach($sigs as $index => $sig) {
			$regex = decodeREGEX($sig->{'regex'});
			$sid = $sig->{'sid'};

			if (preg_match_all("/".$regex."/", $content, $matches)) {
				// $matches[100] = $regex;
				foreach($matches as $key => $match) {
					if (is_int($key)) {
						unset($matches[$key]);
					}
				}
				$toReturn[$sid] = array();
				$toReturn[$sid] = $matches;
				// echo json_encode($matches);
			} 
		}
	}
	mysql_close();		
// print_r($toReturn);
	echo json_encode($toReturn);

	function decodeJSON($text) {
	 	
	  	$text = preg_replace('/&amp;/', "\&", $text);
	  	$text = preg_replace('/&lt;/', "\<", $text);
	  	$text = preg_replace('/&gt;/', "\>", $text);
	  	$text = preg_replace('/&quot;/', "\"", $text);
	  	$text = preg_replace('/&#039;/', "\'", $text);

	  	return $text;
	}

	function decodeREGEX($regex) {
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
		$regex = preg_replace('/_dash_/', "-", $regex);

		return $regex;
	}

?>