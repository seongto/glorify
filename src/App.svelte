<script>
	let name = 'world';
  	let imgUrl = "images/cover2.jpeg";

	let teams = {
		"Glorify" : {
			"cover_img" : ["images/cover1.jpeg","images/cover2.jpeg","images/cover3.jpeg"],
			"title" : "하나님을 뜨겁게 찬양하는 Glorify",
			"description" : "찬양을 사모하는 청년들이 모여 함께 연습하고 교제하며 받은 은혜를 하나님께 찬양드립니다.",
			"photos" : [
				{name:"glorify-2017-01", url:"images/glory-2017-1.jpeg"},
				{name:"glorify-2017-01", url:"images/glory-2017-2.jpeg"},
				{name:"glorify-2017-01", url:"images/glory-2019-1.jpeg"},
				{name:"glorify-2017-01", url:"images/glory-2019-2.jpeg"},
				{name:"glorify-2017-01", url:"images/glory-2019-3.jpeg"},
				{name:"glorify-2017-01", url:"images/glory-2019-5.jpeg"},
			],
			"details":[
				{name:"Activity", content: "비전헌금특순, 특별예배섬김"},
				{name:"Recruting", content: "하나님을 성실하게 찬양드릴 분, 찬양에 은사 있는분, 소프라노, 알토, 베이스, 테너"},
				{name:"Time", content: "주일 순모임 이후 8시~9시 30분"},
				{name:"Location", content:"시온홀"},
				{name:"Contact", content:"오준석 팀"},
				{name:"Prayer Request", content:"Glorify가 찬양을 사모하는 100명의  찬양대가 되어서 단에서 하나님께 최고의 찬양을 드릴수있도록."},
			],
			"videos":[
				{name:"BABA YETU", url:"https://www.youtube.com/watch?v=7irYR9YLduc", yid: "7irYR9YLduc"},
				{name:"축복하노라", url:"https://youtu.be/UBKuoI0ozf8", yid : "7irYR9YLduc"},
			],
		},
	}
	
	let info = teams["Glorify"];
	
</script>

<svelte:head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <meta name="title" content="SNS Glorify Choir">
    <meta name="description" content="온누리교회 청년부 SNS 공동체 글로리파이팀에서 여러분을 환영합니다.">
    <meta name="keywords" content="onnuri, sns, 온누리교회, 온누리, 특순콰이어, 콰이어, 성가대, 4중창">
    <meta name="author" content="Seongsoo Lim">
    <meta property="og:title" content="SNS Glorify Choir"/>
    <meta property="og:description" content="온누리교회 청년부 SNS 공동체 글로리파이팀에서 여러분을 환영합니다."/>
    <meta property="og:type" content="article"/>
    <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/sns-glorify.appspot.com/o/glory-2019-2.jpeg?alt=media&token=6a9a0860-2fb4-4507-9db8-397cd6d2b143">    
    <title>SNS Glorify Choir</title>
</svelte:head>

<div class="cover-img" style="background-image:url({imgUrl});">
	<div class="wrapper">
		<h2>
      		함께 찬양하길<br>원하시나요?
		</h2>
    <a target="_blank" href="https://thinkbetter.typeform.com/to/QsHEm4">글로리파이 지원하기</a>
	</div>
</div>
<div class="wrapper contents">
	<h1>
		{info["title"]}
	</h1>
	<p class="about">
		{info["description"]}
	</p>
	<ul class="photos">
		{#each info["photos"] as { name, url }}
		<li style="background-image:url({url})" alt={name}>

		</li>
		{/each}
	</ul>
	<ul class="details">
		{#each info["details"] as { name, content }}
		<li>
			<h3>
				{name}
			</h3>
			<p>
				{content}
			</p>
		</li>
		{/each}
	</ul>
	<a target="_blank" href="https://thinkbetter.typeform.com/to/QsHEm4" class="btn-apply">글로리파이 지원하기</a>
</div>


<style>
	@import url('https://fonts.googleapis.com/css?family=Noto+Sans+KR:300,900&display=swap');
	
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(h1, h2, h3, p, body, ul) {
		margin: 0;
		padding: 0;
	}

	:global(img) {
		vertical-align: bottom;
		margin: 0;
	}

	:global(li) {
		list-style: none;
	}

	:global(input:focus,
	select:focus,
	textarea:focus,
	button:focus) {
		outline: none;
	}

	:global(input[type="number"]::-webkit-outer-spin-button,
	input[type="number"]::-webkit-inner-spin-button) {
		-webkit-appearance: none;
		margin: 0;
	}

	:global(html, body) {
		width: 100%;
		height: 100%;
	}
	
	:global(body) {
		background-color: #f7f6ee;
	}
	
	.wrapper {
		max-width: 800px;
		margin: 0 auto;
	}
	
	.cover-img {
		background-position: center;
		background-size: cover;
		
		width: 100%;
		height: 100%;
		
		color: white;
	}
	
	.cover-img .wrapper {
		height: 100%;
	}
	
	.cover-img h2 {
		padding-left: 20px;
		font-family: 'Noto Sans KR', sans-serif;
		font-weight: 900;
		font-size: 50px;
		padding-top: 150px;
	}
	
	.cover-img a {
		display: inline-block;
		text-decoration: none;
		background-color: #254a5d;
		color: white;
		margin-left: 20px;
		margin-top: 30px;
		padding: 3px 0px;
		text-align: center;
		font-family: 'Noto Sans KR', sans-serif;
		font-weight: 300;
		font-size: 20px;
		width: 200px;
		opacity: 0.8;
		transition: 0.2s all;
		border: 1px solid #254a5d;
	}
	
	.cover-img a:hover {
		border: 1px solid white;
	}
	
	.contents {
		text-align: center;
		padding-top: 100px;
		font-family: 'Noto Sans KR', sans-serif;
	}
	
	.contents h1 {
		font-weight: 900;
		font-size: 40px;
		padding: 0 20px;
		color: #254a5d;
	}
	
	.contents .about {
		font-size: 16px;
		margin-top: 20px;
		padding: 0 20px;
	}
	
	.contents .photos {
		margin-top: 50px;
		display: grid;
		grid-gap: 5px;
		grid-template-columns: 1fr 1fr;
	}
	.contents .photos li {
		background-size: cover;
		background-position: center;
		height: 240px;
	}
	
	.contents .details {
		margin-top: 60px;
		margin-bottom: 100px;
		padding: 0 20px;
	}
	
	.contents .details li {
		margin-bottom: 50px;
	}
	
	.contents .details li h3{
		display: inline-block;
		color: #7bccd4;
		font-size: 24px;
		margin-bottom: 10px;
		border-bottom: 2px #7bccd4 solid;
	}

	.contents .details li p {
		font-size: 16px;
	}

	.btn-apply {
		display: inline-block;
		width: 200px;
		font-family: 'Noto Sans KR', sans-serif;
		color: #254a5d;
		padding: 4px 10px;
		font-size: 20px;
		font-weight: 400;
		border: 2px #254a5d solid;
		text-decoration: none;
		margin-bottom: 100px;
	}

	.btn-apply:hover {
		color: #7bccd4;
		border-color: #7bccd4;
	}
	
</style>