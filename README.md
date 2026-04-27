# Lotto-site
<!DOCTYPE html>
<html>
<head>
  <title>My Free Lotto</title>
</head>
<body>

<h2>🎰 Free Lotto Generator</h2>
<button onclick="generate()">Generate Numbers</button>
<p id="result"></p>

<script>
function generate() {
  let numbers = [];

  while (numbers.length < 6) {
    let num = Math.floor(Math.random() * 49) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }

  document.getElementById("result").innerText = numbers.join(" - ");
}
</script>

</body>
</html>
