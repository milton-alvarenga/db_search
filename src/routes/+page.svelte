<script>
	import "./style.css";
	import {enhance} from "$app/forms"

	export let data;
	export let form;
</script>

<svelte:head>
	<title>DB Search</title>
	<meta name="description" content="DB Search" />
</svelte:head>


<div class="content">
	<div class="search-area">
		<div class="form-area">
			<form method="POST" action="?/search" use:enhance>
				<div class="inner-form">
					<div class="input-field">
						<button class="btn-search" type="button">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
							</svg>
						</button>
						<input name="terms" type="text" placeholder="What are you looking for?" value={form?.formData.terms ?? ''}>
						{#if form?.formError.terms }
							{#each form?.formError.terms as error}
								<span>{error}</span>
							{/each}
						{/if}
					</div>
				</div>
			</form>
		</div>
	</div>
	{#if form?.formData.terms}
		{#if form.success}
		<div class="result-area">
			{#if form.result.length}
			<div>
				<table>
					<tr>
						<th>Database</th>
						<th>Table</th>
						<th>Field</th>
					</tr>
					{#each form.result as result}
					<tr>
						<td>{result.db_name}</td>
						<td>{result.table_name}</td>
						<td>{result.field_name}</td>
					</tr>
					{/each}
				</table>
			</div>
			{:else}
			<div class="result-empty">
				<h1>No results found!!!</h1>
			</div>
			{/if}
		</div>
		{:else}
			{#if form?.formError.terms.length === 0}
			<div class="result-area">
				<div class="result-error">
					<h1>Error to search.</h1>
					<h2>Try again. If the error persists, please send a message to the system administrator.</h2>
				</div>
			</div>
			{/if}
		{/if}
	{/if}
</div>

<style>
span {
	color:white;
}
table {
	color: white;
	width: 100%;
}
table, th, td {
	border: 1px solid white;
	border-color: white;
	border-collapse: collapse;
}
th {
	font-weight: 700;
}
</style>
