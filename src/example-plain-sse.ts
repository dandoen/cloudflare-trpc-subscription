async function writeToStream(writable: WritableStream) {
	const writer = writable.getWriter();

	let count = 0;
	let eventId = `id-${count}`;
	let msgBody = `{status: ${true}, text: "Hello to SSE message", time: "${new Date().toISOString()}"}`;

	// send hello message
	await constructSSE(writer, eventId, 'userConnected', msgBody);

	// send message every 5 second
	setInterval(function () {
		count++;
		eventId = `id-${count}`;
		msgBody = `{status: ${true}, text: "Repeat message: ${count}", time: "${new Date().toISOString()}"}`;
		constructSSE(writer, eventId, 'userMessage', msgBody);

		console.log(`Sent message: ${count}`);
	}, 1000);
}

async function constructSSE(writer: WritableStreamDefaultWriter<any>, eventId: string, eventType: string, msgBody: string) {
	const encoder = new TextEncoder();

	await writer.write(encoder.encode(`id: ${eventId}` + '\n'));
	if (eventType) {
		await writer.write(encoder.encode(`event: ${eventType}` + '\n'));
	}
	await writer.write(encoder.encode(`data: ${msgBody}` + '\n\n'));
}

export default {
	async fetch() {
		const { readable, writable } = new TransformStream();
		let headers = new Headers();
		headers.append('Content-Type', 'text/event-stream');
		const init = { status: 200, statusText: 'ok', headers: headers };

		writeToStream(writable);
		return new Response(readable, init);
	},
};
