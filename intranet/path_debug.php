<?php
echo "SCRIPT_NAME: " . $_SERVER['SCRIPT_NAME'] . "\n";
echo "DIRNAME: " . dirname($_SERVER['SCRIPT_NAME']) . "\n";
echo "WEB_BASE_PATH: " . rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/') . "/\n";
echo "REQUEST_URI: " . $_SERVER['REQUEST_URI'] . "\n";
?>
