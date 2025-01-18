
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CORS", policy =>
    {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .AllowAnyOrigin();
    });
});


builder.Services.AddSingleton<IDriver>(p =>
{
    var uri = builder.Configuration["Neo4j:Uri"];  // URI za Neo4j bazu podataka
    var user = builder.Configuration["Neo4j:User"];  // Korisničko ime za bazu
    var password = builder.Configuration["Neo4j:Password"];  // Lozinka za bazu
    return GraphDatabase.Driver(uri, AuthTokens.Basic(user, password));
});

builder.Services.AddControllers();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CORS");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
